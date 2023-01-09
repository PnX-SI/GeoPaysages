"""Some icons

Revision ID: ba8ff1826771
Revises: d8d449eefa0f
Create Date: 2022-06-27 08:45:05.556930

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ba8ff1826771'
down_revision = 'd8d449eefa0f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('dico_theme', sa.Column('icon', sa.String(), nullable=True), schema='geopaysages')
    op.add_column('t_observatory', sa.Column('icon', sa.String(), nullable=True), schema='geopaysages')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('t_observatory', 'icon', schema='geopaysages')
    op.drop_column('dico_theme', 'icon', schema='geopaysages')
    # ### end Alembic commands ###