import datetime
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)  # Nullable for OAuth users
    phone = Column(String, nullable=True)
    role = Column(String, default="student", nullable=False)  # student or educator
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    savings = relationship("Savings", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    health_reports = relationship("FinancialHealth", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")


class UserSession(Base):
    __tablename__ = "user_sessions"

    session_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    ip_address = Column(String, nullable=True)
    device = Column(String, nullable=True)
    login_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    logout_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="sessions")
    security_events = relationship("SecurityEvent", back_populates="session", cascade="all, delete-orphan")


class SecurityEvent(Base):
    __tablename__ = "security_events"

    event_id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("user_sessions.session_id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String, nullable=False)  # e.g. failed_login, password_change, suspicious_ip
    severity = Column(String, nullable=False)    # e.g. low, medium, high
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    session = relationship("UserSession", back_populates="security_events")


class Goal(Base):
    __tablename__ = "goals"

    goal_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    goal_name = Column(String, nullable=False)
    target = Column(Numeric(precision=12, scale=2), nullable=False)
    saved = Column(Numeric(precision=12, scale=2), default=0.00, nullable=False)
    deadline = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="goals")


class Savings(Base):
    __tablename__ = "savings"

    save_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(precision=12, scale=2), nullable=False)
    source = Column(String, nullable=False)  # e.g. checking, roundup, manual
    date = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="savings")


class Notification(Base):
    __tablename__ = "notifications"

    notif_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    status = Column(String, default="unread", nullable=False)  # unread, read
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="notifications")


class ChatHistory(Base):
    __tablename__ = "chat_history"

    chat_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="chat_history")


class FinancialHealth(Base):
    __tablename__ = "financial_health"

    report_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    health_score = Column(Integer, nullable=False)
    stress_score = Column(Integer, nullable=False)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="health_reports")
    budgets = relationship("Budget", back_populates="health_report", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    trans_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(precision=12, scale=2), nullable=False)
    category = Column(String, nullable=False)
    merchant = Column(String, nullable=False)
    type = Column(String, nullable=False)  # credit or debit
    date = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    description = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="transactions")
    budgets = relationship("Budget", back_populates="transaction", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="transaction", cascade="all, delete-orphan")


class Budget(Base):
    __tablename__ = "budgets"

    budget_id = Column(Integer, primary_key=True, index=True)
    trans_id = Column(Integer, ForeignKey("transactions.trans_id", ondelete="CASCADE"), nullable=False)
    report_id = Column(Integer, ForeignKey("financial_health.report_id", ondelete="CASCADE"), nullable=False)
    category = Column(String, nullable=False)
    limit_amount = Column(Numeric(precision=12, scale=2), nullable=False)
    spent = Column(Numeric(precision=12, scale=2), default=0.00, nullable=False)
    period = Column(String, nullable=False)  # e.g. weekly, monthly

    # Relationships
    transaction = relationship("Transaction", back_populates="budgets")
    health_report = relationship("FinancialHealth", back_populates="budgets")
    recommendations = relationship("AIRecommendation", back_populates="budget", cascade="all, delete-orphan")


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    rec_id = Column(Integer, primary_key=True, index=True)
    budget_id = Column(Integer, ForeignKey("budgets.budget_id", ondelete="CASCADE"), nullable=False)
    rec_type = Column(String, nullable=False)  # coach, negotiator, dream_engine, stress
    content = Column(Text, nullable=False)

    # Relationships
    budget = relationship("Budget", back_populates="recommendations")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(Integer, primary_key=True, index=True)
    trans_id = Column(Integer, ForeignKey("transactions.trans_id", ondelete="CASCADE"), nullable=False)
    action = Column(String, nullable=False)  # e.g. create, update, delete
    performed_by = Column(String, nullable=False)  # e.g. user, system, educator_id
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    transaction = relationship("Transaction", back_populates="audit_logs")
