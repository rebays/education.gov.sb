# your_app/wagtail_hooks.py
from .mutations import Mutation
from wagtail import hooks


@hooks.register("register_schema_mutation")
def register_author_mutation(mutation_mixins):
    mutation_mixins.append(Mutation)