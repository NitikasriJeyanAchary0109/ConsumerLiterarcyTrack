"""add onboarding completion flag

Revision ID: 005_add_onboarding_completion
Revises: 004_modify_savings
"""

from alembic import op
import sqlalchemy as sa


revision = "005_add_onboarding_completion"
down_revision = "004_modify_savings"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users",
        sa.Column(
            "has_completed_onboarding",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade():
    op.drop_column("users", "has_completed_onboarding")
