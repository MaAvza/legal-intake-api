"""Initial migration: User and Ticket tables

Revision ID: 001
Revises: 
Create Date: 2024-01-15 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Create User and Ticket tables.
    
    Phase 1: User table for lawyer authentication
    Phase 2: Ticket table for client case submissions
    """
    # Create users table (Phase 1)
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Create tickets table (Phase 2)
    op.create_table(
        'tickets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('client_name', sa.String(), nullable=False),
        sa.Column('client_email', sa.String(), nullable=False),
        sa.Column('client_phone', sa.String(), nullable=False),
        sa.Column('event_summary', sa.String(), nullable=False),
        sa.Column('urgency_level', sa.String(), nullable=False, server_default='Low'),
        sa.Column('status', sa.String(), nullable=False, server_default='New'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tickets_id'), 'tickets', ['id'], unique=False)
    op.create_index(op.f('ix_tickets_client_name'), 'tickets', ['client_name'], unique=False)
    op.create_index(op.f('ix_tickets_client_email'), 'tickets', ['client_email'], unique=False)
    op.create_index(op.f('ix_tickets_client_phone'), 'tickets', ['client_phone'], unique=False)


def downgrade() -> None:
    """Drop tables in reverse order"""
    op.drop_index(op.f('ix_tickets_client_phone'), table_name='tickets')
    op.drop_index(op.f('ix_tickets_client_email'), table_name='tickets')
    op.drop_index(op.f('ix_tickets_client_name'), table_name='tickets')
    op.drop_index(op.f('ix_tickets_id'), table_name='tickets')
    op.drop_table('tickets')
    
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
