"""modify transactions table schema

Revision ID: 002_modify_transactions
Revises: 001_initial_schema
Create Date: 2026-08-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002_modify_transactions'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Rename column trans_id to id in transactions
    op.rename_column('transactions', 'trans_id', 'id')
    # 2. Rename column date to transaction_date in transactions
    op.rename_column('transactions', 'date', 'transaction_date')
    # 3. Add new columns to transactions
    op.add_column('transactions', sa.Column('round_up_amount', sa.Numeric(precision=12, scale=2), nullable=False, server_default='0.00'))
    op.add_column('transactions', sa.Column('is_round_up_applied', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('transactions', sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')))
    op.add_column('transactions', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'))

    # 4. Add triggered_by_transaction_id to savings if it's not present
    op.add_column('savings', sa.Column('triggered_by_transaction_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_savings_transactions', 'savings', 'transactions', ['triggered_by_transaction_id'], ['id'])


def downgrade() -> None:
    # Drop foreign key from savings
    op.drop_constraint('fk_savings_transactions', 'savings', type_='foreignkey')
    op.drop_column('savings', 'triggered_by_transaction_id')

    # Drop added columns from transactions
    op.drop_column('transactions', 'is_deleted')
    op.drop_column('transactions', 'created_at')
    op.drop_column('transactions', 'is_round_up_applied')
    op.drop_column('transactions', 'round_up_amount')

    # Rename columns back
    op.rename_column('transactions', 'transaction_date', 'date')
    op.rename_column('transactions', 'id', 'trans_id')
