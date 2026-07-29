import graphene
from grapple.registry import registry
from wagtail import hooks

from .models import NewsPage


NewsCategoryEnum = graphene.Enum.from_enum(NewsPage.Category)


class NewsPagesQuery(graphene.ObjectType):
    news_pages = graphene.List(
        graphene.NonNull(lambda: registry.models[NewsPage]),
        category=NewsCategoryEnum(),
        required=True,
    )

    def resolve_news_pages(self, info, category=None, **kwargs):
        queryset = NewsPage.objects.live().order_by("-date", "-pk")
        if category:
            queryset = queryset.filter(category=category)
        return queryset


@hooks.register("register_schema_query")
def register_news_pages_query(query_mixins):
    query_mixins.append(NewsPagesQuery)
