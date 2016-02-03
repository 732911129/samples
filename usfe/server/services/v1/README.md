# media services v1

## format for find

Find works by doing datastore queries. These queries can search properties. Therefore the format of find works to be a query that can search the datastore.

The operators are: EQ, NE, IN, GT, LT, AND, OR.

I'm thinking something like. 

`/find/kind:EQ:human,age:GT:36`

Each operator can be presented like that. 

We could group with brackets like...

`/find/GROUP:AND:[]`

Tho anytime you need to group...the function always asks how to parse?

So we could do prefix or postfix notation to make it easier. And actually we could not since, these require a fixed arity, and fixing the arity, limits the type of nesting, since there are restrictions on the number and nature of nested groups.

Tho we can only limit ourselves to normalized queries that respect the system limitations of the datastore, so a top level OR with sub clauses of ands. 

So OR can be separated by commas, ands by full stops and relation parts by :, like so:

`/find/kind:EQ:human.age:GT:36,kind:EQ:human.gender:EQ:female.age:LT:32`

The query being to find any humans older than 36, or any female humans younger than 32. 

Nice. 

**alternately**, we could swap the : for the . like so 

`/find/kind.EQ.human:age.GT.36,kind.EQ.human:gender.EQ.female:age.LT.32`

Which could be easier to read. The full query would include quotes, like so

`/find/kind.EQ."human":age.GT."36",kind.EQ."human":gender.EQ."female":age.LT."32"`

## format for search

Let's keep this one simple at first. Just a list of keywords. 

`/search/this is all a query`

Nice.

