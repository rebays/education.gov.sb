from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("resources", "0025_alter_resourcefolder_slug"),
    ]

    operations = [
        migrations.AlterField(
            model_name="resourcefolder",
            name="order",
            field=models.PositiveIntegerField(
                default=0,
                help_text=(
                    "Position among its sibling folders. Set by the reorder "
                    "controls in the library rather than by hand; folders that "
                    "have never been reordered share a position and fall back "
                    "to alphabetical."
                ),
            ),
        ),
    ]
