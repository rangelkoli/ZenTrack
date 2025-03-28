from datetime import datetime
from bson import ObjectId

class Transaction:
    def __init__(self, user_id, description, amount, transaction_type, category, date=None, _id=None):
        self._id = _id or ObjectId()
        self.user_id = user_id
        self.description = description
        self.amount = float(amount)
        self.type = transaction_type  # 'income' or 'expense'
        self.category = category
        self.date = date or datetime.now()
        self.created_at = datetime.now()

    @classmethod
    def from_dict(cls, data):
        return cls(
            user_id=data.get('user_id'),
            description=data.get('description'),
            amount=data.get('amount'),
            transaction_type=data.get('type'),
            category=data.get('category'),
            date=data.get('date'),
            _id=data.get('_id')
        )

    def to_dict(self):
        return {
            '_id': str(self._id),
            'user_id': self.user_id,
            'description': self.description,
            'amount': self.amount,
            'type': self.type,
            'category': self.category,
            'date': self.date.isoformat() if self.date else None,
            'created_at': self.created_at.isoformat()
        }

class Category:
    def __init__(self, user_id, name, color=None, _id=None):
        self._id = _id or ObjectId()
        self.user_id = user_id
        self.name = name
        self.color = color or "#808080"  # Default gray color
        self.created_at = datetime.now()

    @classmethod
    def from_dict(cls, data):
        return cls(
            user_id=data.get('user_id'),
            name=data.get('name'),
            color=data.get('color'),
            _id=data.get('_id')
        )

    def to_dict(self):
        return {
            '_id': str(self._id),
            'user_id': self.user_id,
            'name': self.name,
            'color': self.color,
            'created_at': self.created_at.isoformat()
        }

class Budget:
    def __init__(self, user_id, category, amount, period, _id=None):
        self._id = _id or ObjectId()
        self.user_id = user_id
        self.category = category
        self.amount = float(amount)
        self.period = period  # 'weekly', 'monthly', 'yearly'
        self.created_at = datetime.now()

    @classmethod
    def from_dict(cls, data):
        return cls(
            user_id=data.get('user_id'),
            category=data.get('category'),
            amount=data.get('amount'),
            period=data.get('period'),
            _id=data.get('_id')
        )

    def to_dict(self):
        return {
            '_id': str(self._id),
            'user_id': self.user_id,
            'category': self.category,
            'amount': self.amount,
            'period': self.period,
            'created_at': self.created_at.isoformat()
        }
