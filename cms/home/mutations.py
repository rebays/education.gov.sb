import graphene


class SubmitForm(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        email = graphene.String(required=True)
        message = graphene.String(required=True)

    ok = graphene.Boolean()
    error = graphene.String()

    def mutate(root, info, name, email, message):
        # TODO: save to ContactSubmission model, send email, etc.
        return SubmitForm(ok=True, error=None)


class Mutation(graphene.ObjectType):
    submit_form = SubmitForm.Field()
