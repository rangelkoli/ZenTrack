from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///finances.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'income' or 'expense'
    category = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'amount': self.amount,
            'type': self.type,
            'category': self.category,
            'date': self.date.isoformat()
        }


@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    transactions = Transaction.query.order_by(Transaction.date.desc()).all()
    return jsonify([transaction.to_dict() for transaction in transactions])

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    data = request.json
    new_transaction = Transaction(
        description=data['description'],
        amount=float(data['amount']),
        type=data['type'],
        category=data['category']
    )
    
    db.session.add(new_transaction)
    db.session.commit()
    
    return jsonify(new_transaction.to_dict()), 201

@app.route('/api/transactions/<int:id>', methods=['DELETE'])
def delete_transaction(id):
    transaction = Transaction.query.get_or_404(id)
    db.session.delete(transaction)
    db.session.commit()
    return '', 204

@app.route('/api/summary', methods=['GET'])
def get_summary():
    transactions = Transaction.query.all()
    
    total_income = sum(t.amount for t in transactions if t.type == 'income')
    total_expenses = sum(t.amount for t in transactions if t.type == 'expense')
    
    return jsonify({
        'total_income': total_income,
        'total_expenses': total_expenses,
        'balance': total_income - total_expenses
    })

if __name__ == '__main__':
    app.run(debug=True)