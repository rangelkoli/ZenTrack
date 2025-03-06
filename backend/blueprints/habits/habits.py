from flask import Blueprint, request, jsonify
from db import db
import datetime
from datetime import date, timedelta
import uuid
from typing import List, Dict, Optional

habits_blueprint = Blueprint('habits_blueprint', __name__, url_prefix='/habits')

@habits_blueprint.route('/main/', methods=['POST', 'GET'])
def habits_test():
    response = jsonify({"message": "Habits Blueprint"})
    return response

@habits_blueprint.route('/get_habits/<user_id>', methods=['GET'])
def get_habits(user_id):
    try:
        habits = db.from_('habits')\
            .select('id, name, description, color, icon, frequency, archived, created_at')\
            .eq('user_id', user_id)\
            .eq('archived', False)\
            .order('created_at')\
            .execute()
        
        # Get streaks for each habit
        habit_ids = [habit['id'] for habit in habits.data]
        if habit_ids:
            streaks = db.from_('habit_streaks')\
                .select('habit_id, current_streak, longest_streak')\
                .in_('habit_id', habit_ids)\
                .execute()
            
            # Create a mapping of habit_id to streak info
            streak_map = {streak['habit_id']: streak for streak in streaks.data}
            
            # Add streak info to each habit
            for habit in habits.data:
                streak_info = streak_map.get(habit['id'], {})
                habit['streak'] = streak_info.get('current_streak', 0)
                habit['longest_streak'] = streak_info.get('longest_streak', 0)
        
        return jsonify(habits.data), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@habits_blueprint.route('/get_completions/<user_id>', methods=['GET'])
def get_completions(user_id):
    try:
        # Get date range parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Get all habits for the user
        habits = db.from_('habits')\
            .select('id')\
            .eq('user_id', user_id)\
            .eq('archived', False)\
            .execute()
        
        habit_ids = [habit['id'] for habit in habits.data]
        
        if not habit_ids:
            return jsonify([]), 200
            
        # Query completions within date range
        query = db.from_('habit_completions')\
            .select('habit_id, completed_at')\
            .in_('habit_id', habit_ids)
            
        if start_date:
            query = query.gte('completed_at', start_date)
        if end_date:
            query = query.lte('completed_at', end_date)
            
        completions = query.execute()
        
        return jsonify(completions.data), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@habits_blueprint.route('/add_habit', methods=['POST'])
def add_habit():
    try:
        data = request.json
        habit_id = str(uuid.uuid4())
        
        new_habit = {
            'id': habit_id,
            'user_id': data['user_id'],
            'name': data['name'],
            'description': data.get('description', ''),
            'color': data.get('color', '#4CAF50'),
            'icon': data.get('icon', 'check'),
            'frequency': data.get('frequency', {'type': 'daily', 'days': [1,2,3,4,5,6,0]}),
            'created_at': datetime.datetime.now().isoformat(),
            'updated_at': datetime.datetime.now().isoformat(),
            'archived': False
        }
        
        # Insert the habit
        db.from_('habits').insert([new_habit]).execute()
        
        # Initialize streak info
        streak_info = {
            'habit_id': habit_id,
            'current_streak': 0,
            'longest_streak': 0,
            'updated_at': datetime.datetime.now().isoformat()
        }
        
        db.from_('habit_streaks').insert([streak_info]).execute()
        
        return jsonify(new_habit), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@habits_blueprint.route('/toggle_completion', methods=['POST'])
def toggle_completion():
    try:
        data = request.json
        habit_id = data['habit_id']
        date_str = data['date']  # Format: YYYY-MM-DD
        
        # Check if completion exists
        completion = db.from_('habit_completions')\
            .select('id')\
            .eq('habit_id', habit_id)\
            .eq('completed_at', date_str)\
            .execute()
        
        if completion.data:
            # If exists, delete it (toggle off)
            db.from_('habit_completions')\
                .delete()\
                .eq('habit_id', habit_id)\
                .eq('completed_at', date_str)\
                .execute()
            completed = False
        else:
            # If doesn't exist, add it (toggle on)
            new_completion = {
                'habit_id': habit_id,
                'completed_at': date_str,
                'created_at': datetime.datetime.now().isoformat()
            }
            db.from_('habit_completions').insert([new_completion]).execute()
            completed = True
        
        # Update streak
        _update_streak(habit_id)
        
        return jsonify({"status": "success", "completed": completed}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@habits_blueprint.route('/update_habit', methods=['POST'])
def update_habit():
    try:
        data = request.json
        habit_id = data['id']
        
        updated_data = {
            'name': data['name'],
            'description': data.get('description', ''),
            'color': data.get('color', '#4CAF50'),
            'icon': data.get('icon', 'check'),
            'frequency': data.get('frequency', {'type': 'daily', 'days': [1,2,3,4,5,6,0]}),
            'updated_at': datetime.datetime.now().isoformat()
        }
        
        db.from_('habits')\
            .update(updated_data)\
            .eq('id', habit_id)\
            .execute()
            
        # After updating frequency, recalculate streak
        _update_streak(habit_id)
        
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@habits_blueprint.route('/archive_habit', methods=['POST'])
def archive_habit():
    try:
        data = request.json
        habit_id = data['id']
        archive = data.get('archive', True)
        
        db.from_('habits')\
            .update({'archived': archive, 'updated_at': datetime.datetime.now().isoformat()})\
            .eq('id', habit_id)\
            .execute()
            
        return jsonify({"status": "success", "archived": archive}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def _update_streak(habit_id: str):
    """Update the streak information for a habit"""
    try:
        # Get habit frequency info
        habit = db.from_('habits')\
            .select('frequency')\
            .eq('id', habit_id)\
            .execute()
            
        if not habit.data:
            return
            
        frequency = habit.data[0]['frequency']
        today = date.today()
        
        # Get all completions for this habit
        completions = db.from_('habit_completions')\
            .select('completed_at')\
            .eq('habit_id', habit_id)\
            .order('completed_at', desc=True)\
            .execute()
            
        # Convert to date objects and sort
        completion_dates = [date.fromisoformat(c['completed_at']) for c in completions.data]
        completion_dates.sort(reverse=True)
        
        # Calculate current streak
        current_streak = 0
        check_date = today
        
        while True:
            # Skip days when habit is not scheduled
            if not _is_habit_scheduled_for_date(check_date, frequency):
                check_date -= timedelta(days=1)
                continue
                
            if check_date in completion_dates:
                current_streak += 1
                check_date -= timedelta(days=1)
            else:
                break
        
        # Get existing streak data
        streak_data = db.from_('habit_streaks')\
            .select('*')\
            .eq('habit_id', habit_id)\
            .execute()
            
        if streak_data.data:
            longest_streak = streak_data.data[0]['longest_streak']
            # Update longest streak if current is greater
            if current_streak > longest_streak:
                longest_streak = current_streak
                
            # Update streak in database
            db.from_('habit_streaks')\
                .update({
                    'current_streak': current_streak,
                    'longest_streak': longest_streak,
                    'last_completed_at': today.isoformat() if completion_dates else None,
                    'updated_at': datetime.datetime.now().isoformat()
                })\
                .eq('habit_id', habit_id)\
                .execute()
        else:
            # Insert new streak record
            db.from_('habit_streaks')\
                .insert([{
                    'habit_id': habit_id,
                    'current_streak': current_streak,
                    'longest_streak': current_streak,
                    'last_completed_at': today.isoformat() if completion_dates else None,
                    'updated_at': datetime.datetime.now().isoformat()
                }])\
                .execute()
                
    except Exception as e:
        print(f"Error updating streak: {str(e)}")

def _is_habit_scheduled_for_date(check_date: date, frequency: Dict) -> bool:
    """Check if habit is scheduled for the given date based on frequency settings"""
    freq_type = frequency.get('type', 'daily')
    
    if freq_type == 'daily':
        # Check if this day of week is included
        day_of_week = check_date.weekday()  # 0-6 (Monday-Sunday)
        if day_of_week == 6:  # Convert Sunday from 6 to 0 to match frontend format
            day_of_week = 0
        else:
            day_of_week += 1  # Convert to 1-6 (Monday-Saturday)
            
        return day_of_week in frequency.get('days', [1,2,3,4,5,6,0])
        
    elif freq_type == 'custom':
        # For custom interval (every X days)
        interval = frequency.get('interval', 1)
        start_date = date.fromisoformat(frequency.get('startDate', '2023-01-01'))
        days_since_start = (check_date - start_date).days
        return days_since_start % interval == 0
        
    return True  # Default to scheduled if no matching frequency type