"""
Adds a creation timestamp to folders.

Hand-written because auto_now_add needs a one-off value for rows that already
exist. There's no record of when they were made, so they all take the moment
of migration — only the dates on pre-existing folders are affected, and only
where none was knowable.
"""

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("resources", "0027_alter_resourcefolder_order"),
    ]

    operations = [
        migrations.AddField(
            model_name="resourcefolder",
            name="created_at",
            field=models.DateTimeField(
                auto_now_add=True,
                db_index=True,
                default=django.utils.timezone.now,
            ),
            preserve_default=False,
        ),
    ]
