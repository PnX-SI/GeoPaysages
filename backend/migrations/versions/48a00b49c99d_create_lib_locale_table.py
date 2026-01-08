"""Create lib_locale table

Revision ID: 48a00b49c99d
Revises: 4a02bd35bb30
Create Date: 2024-11-04 16:36:30.401347

"""

from alembic import op
import sqlalchemy as sa
import os
import csv

# revision identifiers, used by Alembic.
revision = "48a00b49c99d"
down_revision = "4a02bd35bb30"
branch_labels = None
depends_on = None


def upgrade():
    current_dir = os.path.dirname(__file__)  # Répertoire courant du fichier de révision
    data_dir = os.path.join(current_dir, "..", "data")  # Accéder au dossier data

    # Créer la table lib_locale
    op.create_table(
        "lib_locales",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("language", sa.String, nullable=True),
    )

    # Insertion des données dans la table lib_locale
    conn = op.get_bind()
    csv_file_path = os.path.join(data_dir, "locales.csv")

    with open(csv_file_path, "r", encoding="utf-8") as csv_file:
        csv_reader = csv.DictReader(csv_file, delimiter=",")
        csv_locales_to_insert = []

        for row in csv_reader:
            locale = row["id"]  # Correspond à locale
            language = row["value"]  # Correspond à country_name
            csv_locales_to_insert.append((locale, language))

    # Insertion des données CSV dans la table lib_locale
    conn.execute(
        sa.table("lib_locales", sa.column("id"), sa.column("language")).insert(),
        [{"id": row[0], "language": row[1]} for row in csv_locales_to_insert],
    )


def downgrade():
    # Supprimer la table lib_locale
    op.drop_table("lib_locales")
