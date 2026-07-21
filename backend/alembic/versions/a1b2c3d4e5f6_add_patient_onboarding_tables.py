"""add patient onboarding tables

Revision ID: a1b2c3d4e5f6
Revises: 71267e3efd99
Create Date: 2026-07-21 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = '71267e3efd99'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'patient_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('pronouns', sa.String(length=50), nullable=True),
        sa.Column('emergency_contact_name', sa.String(length=200), nullable=True),
        sa.Column('emergency_contact_phone', sa.String(length=50), nullable=True),
        sa.Column('presenting_concerns', sa.Text(), nullable=True),
        sa.Column('goals', sa.Text(), nullable=True),
        sa.Column('onboarding_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('consent_given', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('consent_given_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('patient_id'),
    )
    op.create_index('ix_patient_profiles_id', 'patient_profiles', ['id'])
    op.create_index('ix_patient_profiles_patient_id', 'patient_profiles', ['patient_id'])

    op.create_table(
        'onboarding_screeners',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('screener_type', sa.String(length=10), nullable=False),
        sa.Column('responses', sa.JSON(), nullable=False),
        sa.Column('total_score', sa.Integer(), nullable=False),
        sa.Column('severity_label', sa.String(length=50), nullable=False),
        sa.Column('crisis_flag', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_onboarding_screeners_id', 'onboarding_screeners', ['id'])
    op.create_index('ix_onboarding_screeners_patient_id', 'onboarding_screeners', ['patient_id'])


def downgrade() -> None:
    op.drop_index('ix_onboarding_screeners_patient_id', table_name='onboarding_screeners')
    op.drop_index('ix_onboarding_screeners_id', table_name='onboarding_screeners')
    op.drop_table('onboarding_screeners')
    op.drop_index('ix_patient_profiles_patient_id', table_name='patient_profiles')
    op.drop_index('ix_patient_profiles_id', table_name='patient_profiles')
    op.drop_table('patient_profiles')
