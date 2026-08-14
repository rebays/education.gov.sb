import graphene
from grapple.registry import registry
from wagtail import hooks

# Imported purely for the side effect: viewsets.py calls register_snippet(),
# which is what puts Publications in the sidebar. Wagtail auto-imports
# wagtail_hooks.py but never viewsets.py, so without this line the module
# never executes and the model has no admin UI at all.
#
# The name genuinely is unused, so ruff reads it as a dead import — it was
# removed as F401 in 304d372 and took the Publications menu item with it.
# Keep the noqa; publication/tests.py fails if the registration goes missing.
from . import viewsets  # noqa: F401
from .models import Publication

# --- Frontend GraphQL queries ---
# Publication is a plain model (a registered admin snippet, but not exposed
# through Grapple's snippet machinery — see the comment on its
# graphql_fields), so it has no page(urlPath:) route. These root fields are
# the only way the frontend can fetch it.


class PublicationsQuery(graphene.ObjectType):
    publications = graphene.List(
        lambda: registry.models[Publication],
        publication_type=graphene.String(),
        office=graphene.String(),
    )
    publication = graphene.Field(
        lambda: registry.models[Publication],
        slug=graphene.String(required=True),
    )

    def resolve_publications(self, info, publication_type=None, office=None, **kwargs):
        queryset = Publication.objects.all()
        if publication_type:
            queryset = queryset.filter(publication_type=publication_type)
        if office:
            queryset = queryset.filter(office=office)
        return queryset

    def resolve_publication(self, info, slug, **kwargs):
        return Publication.objects.filter(slug=slug).first()


@hooks.register("register_schema_query")
def register_publications_query(query_mixins):
    query_mixins.append(PublicationsQuery)
