using System;
using System.Linq;
using System.Linq.Expressions;

namespace Ice.Utils;

public static class QueryableExtension
{
    public static IQueryable<T> IceOrderBy<T>(this IQueryable<T> queryable, string sort, bool des = false)
    {
        var param = Expression.Parameter(typeof(T));
        var body = Expression.Convert(Expression.Property(param, sort), typeof(object));

        var keySelector = Expression.Lambda<Func<T, object>>(body, param);

        if (des)
        {
            return queryable.OrderByDescending(keySelector);
        }

        return queryable.OrderBy(keySelector);
    }
}