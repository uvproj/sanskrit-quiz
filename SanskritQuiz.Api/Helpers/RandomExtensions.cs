public static class RandomExtensions
{
    public static int GetRandomExcept(this Random random, int startInclusive, int endExclusive, int except)
    {
        int result = random.Next(startInclusive, endExclusive);
        if (result == except)
        {
            if (result + 1 < endExclusive)
                result++;
            else
                result--;
        }
        return result;
    }

    public static IEnumerable<T> GetRandomItems<T>(this Random random, IEnumerable<T> items, int count)
    {
        return items.OrderBy(x => random.Next()).Take(count);
    }
}