import base64

import graphene
from django.db.models import Q
from grapple.registry import registry
from wagtail import hooks

from .models import NewsPage


MAX_PAGE_SIZE = 25

NewsCategoryEnum = graphene.Enum.from_enum(NewsPage.Category)


def _encode_cursor(page):
    return base64.b64encode(f"{page.date.isoformat()}:{page.pk}".encode()).decode()


def _decode_cursor(cursor):
    try:
        date_str, pk = base64.b64decode(cursor).decode().split(":")
        return date_str, int(pk)
    except (ValueError, TypeError):
        raise ValueError("Invalid cursor")


class NewsPageEdge(graphene.ObjectType):
    cursor = graphene.String(required=True)
    node = graphene.Field(lambda: registry.models[NewsPage], required=True)


class NewsPageInfo(graphene.ObjectType):
    has_next_page = graphene.Boolean(required=True)
    end_cursor = graphene.String()


class NewsPageConnection(graphene.ObjectType):
    edges = graphene.List(graphene.NonNull(NewsPageEdge), required=True)
    page_info = graphene.Field(NewsPageInfo, required=True)


class NewsPagesQuery(graphene.ObjectType):
    news_pages = graphene.Field(
        NewsPageConnection,
        category=NewsCategoryEnum(),
        first=graphene.Int(default_value=10),
        after=graphene.String(),
        required=True,
    )

    def resolve_news_pages(self, info, first=10, after=None, category=None, **kwargs):
        first = max(1, min(first, MAX_PAGE_SIZE))

        queryset = NewsPage.objects.live().order_by("-date", "-pk")
        if category:
            queryset = queryset.filter(category=category)

        if after:
            cursor_date, cursor_pk = _decode_cursor(after)
            # Rows strictly "after" the cursor under (-date, -pk) ordering:
            # an earlier date, or the same date with a smaller pk.
            queryset = queryset.filter(
                Q(date__lt=cursor_date)
                | (Q(date=cursor_date) & Q(pk__lt=cursor_pk))
            )

        rows = list(queryset[: first + 1])
        has_next = len(rows) > first
        rows = rows[:first]

        edges = [NewsPageEdge(cursor=_encode_cursor(p), node=p) for p in rows]
        return NewsPageConnection(
            edges=edges,
            page_info=NewsPageInfo(
                has_next_page=has_next,
                end_cursor=edges[-1].cursor if edges else None,
            ),
        )


@hooks.register("register_schema_query")
def register_news_pages_query(query_mixins):
    query_mixins.append(NewsPagesQuery)
