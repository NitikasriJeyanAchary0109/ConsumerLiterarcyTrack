"""modify goals

Revision ID: 003_modify_goals
Revises: 002_modify_transactions
Create Date: 2026-08-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '003_modify_goals'
down_revision = '002_modify_transactions'
branch_labels = None
depends_on = None

def upgrade():
    # Rename columns in goals table
    op.alter_column('goals', 'goal_id', new_column_name='id')
    op.alter_column('goals', 'goal_name', new_column_name='title')
    op.alter_column('goals', 'target', new_column_name='target_amount')
    op.alter_column('goals', 'saved', new_column_name='current_amount')
    op.alter_column('goals', 'deadline', new_column_name='target_date')

    # Add new columns
    op.add_column('goals', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('goals', sa.Column('is_deleted', sa.Boolean(), nullable=True))

    # Set default values for existing rows
    op.execute("UPDATE goals SET created_at = NOW() WHERE created_at IS NULL")
    op.execute("UPDATE goals SET is_deleted = FALSE WHERE is_deleted IS NULL")

    # Alter columns to be non-nullable as per schema
    op.alter_column('goals', 'created_at', nullable=False)
    op.alter_column('goals', 'is_deleted', nullable=False)


def downgrade():
    # Remove new columns
    op.drop_column('goals', 'is_deleted')
    op.drop_column('goals', 'created_at')

    # Rename columns back to original
    op.alter_column('goals', 'target_date', new_column_name='deadline')
    op.alter_column('goals', 'current_amount', new_column_name='saved')
    op.alter_column('goals', 'target_amount', new_column_name='target')
    op.alter_column('goals', 'title', new_column_name='goal_name')
    op.alter_column('goals', 'id', new_column_name='goal_id')
