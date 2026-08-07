import graphene
from grapple.registry import registry
from wagtail import hooks

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
