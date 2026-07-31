"""initial schema 11 tables

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-07-31 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Create Users
    op.create_table(
        'users',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=True),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('role', sa.String(), nullable=False, server_default='student'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('user_id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_user_id'), 'users', ['user_id'], unique=False)

    # 2. Create User Sessions
    op.create_table(
        'user_sessions',
        sa.Column('session_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('ip_address', sa.String(), nullable=True),
        sa.Column('device', sa.String(), nullable=True),
        sa.Column('login_at', sa.DateTime(), nullable=False),
        sa.Column('logout_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('session_id')
    )
    op.create_index(op.f('ix_user_sessions_session_id'), 'user_sessions', ['session_id'], unique=False)

    # 3. Create Security Events
    op.create_table(
        'security_events',
        sa.Column('event_id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('severity', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['user_sessions.session_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('event_id')
    )
    op.create_index(op.f('ix_security_events_event_id'), 'security_events', ['event_id'], unique=False)

    # 4. Create Goals
    op.create_table(
        'goals',
        sa.Column('goal_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('goal_name', sa.String(), nullable=False),
        sa.Column('target', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('saved', sa.Numeric(precision=12, scale=2), nullable=False, server_default='0.00'),
        sa.Column('deadline', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('goal_id')
    )
    op.create_index(op.f('ix_goals_goal_id'), 'goals', ['goal_id'], unique=False)

    # 5. Create Savings
    op.create_table(
        'savings',
        sa.Column('save_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('source', sa.String(), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('save_id')
    )
    op.create_index(op.f('ix_savings_save_id'), 'savings', ['save_id'], unique=False)

    # 6. Create Notifications
    op.create_table(
        'notifications',
        sa.Column('notif_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('message', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, server_default='unread'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('notif_id')
    )
    op.create_index(op.f('ix_notifications_notif_id'), 'notifications', ['notif_id'], unique=False)

    # 7. Create Chat History
    op.create_table(
        'chat_history',
        sa.Column('chat_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('question', sa.Text(), nullable=False),
        sa.Column('response', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('chat_id')
    )
    op.create_index(op.f('ix_chat_history_chat_id'), 'chat_history', ['chat_id'], unique=False)

    # 8. Create Financial Health
    op.create_table(
        'financial_health',
        sa.Column('report_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('health_score', sa.Integer(), nullable=False),
        sa.Column('stress_score', sa.Integer(), nullable=False),
        sa.Column('ai_summary', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('report_id')
    )
    op.create_index(op.f('ix_financial_health_report_id'), 'financial_health', ['report_id'], unique=False)

    # 9. Create Transactions
    op.create_table(
        'transactions',
        sa.Column('trans_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('merchant', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False, server_default='debit'),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('trans_id')
    )
    op.create_index(op.f('ix_transactions_trans_id'), 'transactions', ['trans_id'], unique=False)

    # 10. Create Budgets
    op.create_table(
        'budgets',
        sa.Column('budget_id', sa.Integer(), nullable=False),
        sa.Column('trans_id', sa.Integer(), nullable=False),
        sa.Column('report_id', sa.Integer(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('limit_amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('spent', sa.Numeric(precision=12, scale=2), nullable=False, server_default='0.00'),
        sa.Column('period', sa.String(), nullable=False, server_default='monthly'),
        sa.ForeignKeyConstraint(['report_id'], ['financial_health.report_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['trans_id'], ['transactions.trans_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('budget_id')
    )
    op.create_index(op.f('ix_budgets_budget_id'), 'budgets', ['budget_id'], unique=False)

    # 11. Create AI Recommendations
    op.create_table(
        'ai_recommendations',
        sa.Column('rec_id', sa.Integer(), nullable=False),
        sa.Column('budget_id', sa.Integer(), nullable=False),
        sa.Column('rec_type', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(['budget_id'], ['budgets.budget_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('rec_id')
    )
    op.create_index(op.f('ix_ai_recommendations_rec_id'), 'ai_recommendations', ['rec_id'], unique=False)

    # 12. Create Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('log_id', sa.Integer(), nullable=False),
        sa.Column('trans_id', sa.Integer(), nullable=False),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('performed_by', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['trans_id'], ['transactions.trans_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('log_id')
    )
    op.create_index(op.f('ix_audit_logs_log_id'), 'audit_logs', ['log_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_audit_logs_log_id'), table_name='audit_logs')
    op.drop_table('audit_logs')
    op.drop_index(op.f('ix_ai_recommendations_rec_id'), table_name='ai_recommendations')
    op.drop_table('ai_recommendations')
    op.drop_index(op.f('ix_budgets_budget_id'), table_name='budgets')
    op.drop_table('budgets')
    op.drop_index(op.f('ix_transactions_trans_id'), table_name='transactions')
    op.drop_table('transactions')
    op.drop_index(op.f('ix_financial_health_report_id'), table_name='financial_health')
    op.drop_table('financial_health')
    op.drop_index(op.f('ix_chat_history_chat_id'), table_name='chat_history')
    op.drop_table('chat_history')
    op.drop_index(op.f('ix_notifications_notif_id'), table_name='notifications')
    op.drop_table('notifications')
    op.drop_index(op.f('ix_savings_save_id'), table_name='savings')
    op.drop_table('savings')
    op.drop_index(op.f('ix_goals_goal_id'), table_name='goals')
    op.drop_table('goals')
    op.drop_index(op.f('ix_security_events_event_id'), table_name='security_events')
    op.drop_table('security_events')
    op.drop_index(op.f('ix_user_sessions_session_id'), table_name='user_sessions')
    op.drop_table('user_sessions')
    op.drop_index(op.f('ix_users_user_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
