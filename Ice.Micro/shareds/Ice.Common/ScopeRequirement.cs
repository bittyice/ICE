using Microsoft.AspNetCore.Authorization;

public class ScopeRequirement :
    AuthorizationHandler<ScopeRequirement>,
    IAuthorizationRequirement
{
    protected string Scope { get; set; }

    public ScopeRequirement(string scope)
    {
        this.Scope = scope;
    }

    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ScopeRequirement requirement)
    {
        var user = context.User;

        if (user.Identity == null || user.Identity.IsAuthenticated == false)
        {
            // 禁止访问
            return Task.CompletedTask;
        }

        var scopes = user.FindAll("scope");
        if (!scopes.Any(e => this.Scope == e.Value))
        {
            return Task.CompletedTask;
        }

        context.Succeed(requirement);

        return Task.CompletedTask;
    }
}