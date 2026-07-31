"""modify savings

Revision ID: 004_modify_savings
Revises: 003_modify_goals
Create Date: 2026-08-01 00:01:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '004_modify_savings'
down_revision = '003_modify_goals'
branch_labels = None
depends_on = None


def upgrade():
    # Rename columns in savings table
    op.alter_column('savings', 'save_id', new_column_name='id')
    op.alter_column('savings', 'date', new_column_name='created_at')

    # Update any 'roundup' source values to 'round_up' for consistency
    op.execute("UPDATE savings SET source = 'round_up' WHERE source = 'roundup'")


def downgrade():
    # Rename columns back
    op.alter_column('savings', 'created_at', new_column_name='date')
    op.alter_column('savings', 'id', new_column_name='save_id')

    # Revert 'round_up' to 'roundup'
    op.execute("UPDATE savings SET source = 'roundup' WHERE source = 'round_up'")
