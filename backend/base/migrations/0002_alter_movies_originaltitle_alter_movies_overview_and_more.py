# Generated by Django 5.0.2 on 2024-09-26 15:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='movies',
            name='originalTitle',
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='movies',
            name='overview',
            field=models.TextField(null=True),
        ),
        migrations.AlterField(
            model_name='movies',
            name='runtime',
            field=models.IntegerField(null=True),
        ),
    ]
