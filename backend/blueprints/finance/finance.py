from flask import Blueprint, request, jsonify
import re
import bcrypt
import datetime
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
import json
from flask_cors import cross_origin
from db import db

finance_blueprint = Blueprint('finance_blueprint', __name__, url_prefix='/finance')



@finance_blueprint.route('/main', methods=['GET'])
@cross_origin()
def finance():
    response = jsonify({"message": "Finance Blueprint"})
    return response

# Transaction endpoints
@finance_blueprint.route('/transactions', methods=['GET'])
@cross_origin()
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    
    # Get query parameters for filtering
    category = request.args.get('category')
    transaction_type = request.args.get('type')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Build query filter
    query_filter = {'user_id': user_id}
    if category:
        query_filter['category'] = category
    if transaction_type:
        query_filter['type'] = transaction_type
    if start_date and end_date:
        query_filter['date'] = {
            '$gte': start_date,
            '$lte': end_date
        }
    
    # Fetch transactions from Supabase
    query = db.table('transactions').select('*').eq('user_id', user_id)
    if category:
        query = query.eq('category', category)
    if transaction_type:
        query = query.eq('type', transaction_type)
    if start_date and end_date:
        query = query.gte('date', start_date).lte('date', end_date)
        
    transactions = query.order('date', desc=True).execute()
    
    return jsonify(transactions.data)

@finance_blueprint.route('/transactions', methods=['POST'])
@cross_origin()
@jwt_required()
def add_transaction():
    user_id = get_jwt_identity()
    data = request.json
    
    # Validate required fields
    if not all(key in data for key in ['description', 'amount', 'type', 'category', 'date']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Create transaction document
    transaction = {
        'user_id': user_id,
        'description': data['description'],
        'amount': float(data['amount']),
        'type': data['type'],  # 'income' or 'expense'
        'category': data['category'],
        'date': data['date'],
        'created_at': datetime.now().isoformat()
    }
    
    # Insert transaction into Supabase
    result = db.table('transactions').insert(transaction).execute()
    
    if result.data:
        return jsonify(result.data[0]), 201
    else:
        return jsonify({'error': 'Failed to add transaction'}), 500

@finance_blueprint.route('/transactions/<transaction_id>', methods=['DELETE'])
@cross_origin()
@jwt_required()
def delete_transaction(transaction_id):
    user_id = get_jwt_identity()
    
    # Delete transaction from Supabase
    result = db.table('transactions').delete().eq('id', transaction_id).eq('user_id', user_id).execute()
    
    if result.row_count:
        return jsonify({'message': 'Transaction deleted successfully'}), 200
    return jsonify({'error': 'Transaction not found'}), 404

@finance_blueprint.route('/transactions/<transaction_id>', methods=['PUT'])
@cross_origin()
@jwt_required()
def update_transaction(transaction_id):
    user_id = get_jwt_identity()
    data = request.json
    
    # Filter out None values and create update document
    update_data = {k: v for k, v in data.items() if v is not None}
    
    result = db.table('transactions').update(update_data).eq('id', transaction_id).eq('user_id', user_id).execute()
    
    if result.data:
        return jsonify(result.data[0]), 200
    return jsonify({'error': 'Transaction not found'}), 404

# Categories endpoints
@finance_blueprint.route('/categories', methods=['GET'])
@cross_origin()
@jwt_required()
def get_categories():
    user_id = get_jwt_identity()
    
    # Fetch categories from Supabase
    categories = db.table('categories').select('*').eq('user_id', user_id).execute()
    return jsonify(categories.data)

@finance_blueprint.route('/categories', methods=['POST'])
@cross_origin()
@jwt_required()
def add_category():
    user_id = get_jwt_identity()
    data = request.json
    
    if not 'name' in data:
        return jsonify({'error': 'Category name is required'}), 400
    
    # Check if category already exists
    existing = db.table('categories').select('*').eq('user_id', user_id).eq('name', data['name']).execute()
    if existing.data:
        return jsonify({'error': 'Category already exists'}), 400
    
    category = {
        'user_id': user_id,
        'name': data['name'],
        'color': data.get('color', '#808080'),
        'created_at': datetime.now().isoformat()
    }
    
    result = db.table('categories').insert(category).execute()
    
    if result.data:
        return jsonify(result.data[0]), 201
    else:
        return jsonify({'error': 'Failed to add category'}), 500

# Budget endpoints
@finance_blueprint.route('/budgets', methods=['GET'])
@cross_origin()
@jwt_required()
def get_budgets():
    user_id = get_jwt_identity()
    
    # Fetch budgets from Supabase
    budgets = db.table('budgets').select('*').eq('user_id', user_id).execute()
    return jsonify(budgets.data)

@finance_blueprint.route('/budgets', methods=['POST'])
@cross_origin()
@jwt_required()
def add_budget():
    user_id = get_jwt_identity()
    data = request.json
    
    # Validate required fields
    if not all(key in data for key in ['category', 'amount', 'period']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Create budget document
    budget = {
        'user_id': user_id,
        'category': data['category'],
        'amount': float(data['amount']),
        'period': data['period'],  # 'weekly', 'monthly', 'yearly'
        'created_at': datetime.now().isoformat()
    }
    
    # Insert budget into Supabase
    result = db.table('budgets').insert(budget).execute()
    
    if result.data:
        return jsonify(result.data[0]), 201
    else:
        return jsonify({'error': 'Failed to add budget'}), 500

# Analytics endpoints
@finance_blueprint.route('/summary', methods=['GET'])
@cross_origin()
@jwt_required()
def get_summary():
    user_id = get_jwt_identity()
    
    # Get date range from query parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Build date filter
    date_filter = {}
    if start_date and end_date:
        date_filter = {
            'gte': start_date,
            'lte': end_date
        }
    
    # Build query filter
    query_filter = {'user_id': user_id}
    if date_filter:
        query_filter['date'] = date_filter
    
    # Aggregate income transactions
    income_result = db.table('transactions').select('amount').eq('user_id', user_id).eq('type', 'income').gte('date', start_date).lte('date', end_date).execute()
   
    # Aggregate expense transactions
    expense_result =  db.table('transactions').select('amount').eq('user_id', user_id).eq('type', 'expense').gte('date', start_date).lte('date', end_date).execute()
    
    # Aggregate expenses by category
    category_result = db.table('transactions').select('category, amount').eq('user_id', user_id).eq('type', 'expense').gte('date', start_date).lte('date', end_date).execute()
    
    total_income = sum([item['amount'] for item in income_result.data]) if income_result.data else 0
    total_expenses = sum([item['amount'] for item in expense_result.data]) if expense_result.data else 0
    
    # category_breakdown = [{'category': item['category'], 'amount': item['amount']} for item in category_result.data]
    
    # Group expenses by category
    category_breakdown = {}
    for item in category_result.data:
        category = item['category']
        amount = item['amount']
        if category in category_breakdown:
            category_breakdown[category] += amount
        else:
            category_breakdown[category] = amount
    
    # Convert to list format
    category_breakdown_list = [{'category': category, 'amount': amount} for category, amount in category_breakdown.items()]
    
    summary = {
        'totalIncome': total_income,
        'totalExpenses': total_expenses,
        'balance': total_income - total_expenses,
        'categories': category_breakdown_list
    }
    
    return jsonify(summary)

@finance_blueprint.route('/trends', methods=['GET'])
@cross_origin()
@jwt_required()
def get_trends():
    user_id = get_jwt_identity()
    period = request.args.get('period', 'monthly')  # 'daily', 'weekly', 'monthly'
    
    # Define date format for grouping based on period
    date_format = {
        'daily': '%Y-%m-%d',
        'weekly': '%Y-%U',  # Year-Week number
        'monthly': '%Y-%m'
    }
    
    # Fetch transactions from Supabase
    transactions = db.table('transactions').select('date, amount, type').eq('user_id', user_id).execute()
    
    # Transform results into a more frontend-friendly format
    trends = {}
    for item in transactions.data:
        date_obj = datetime.strptime(item['date'], '%Y-%m-%dT%H:%M:%S.%fZ')
        
        if period == 'daily':
            date = date_obj.strftime('%Y-%m-%d')
        elif period == 'weekly':
            date = date_obj.strftime('%Y-%U')
        else:
             date = date_obj.strftime('%Y-%m')
        
        transaction_type = item['type']
        amount = item['amount']
        
        if date not in trends:
            trends[date] = {'income': 0, 'expense': 0}
        
        trends[date][transaction_type] += amount
    
    # Convert to list format
    trend_list = [{'date': date, 'income': data['income'], 'expense': data['expense']} 
                  for date, data in trends.items()]
    
    return jsonify(trend_list)

