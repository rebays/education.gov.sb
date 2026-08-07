# your_app/wagtail_hooks.py
from wagtail import hooks

from .mutations import Mutation


@hooks.register("register_schema_mutation")
def register_author_mutation(mutation_mixins):
    mutation_mixins.append(Mutation)