How do we convert this ...

```
  { 'operand': 'OR',
    'parameters': [ { 'operand': 'AND',
                      'parameters': [ { 'name': 'id',
                                        'operand': 'is',
                                        'values': 'a'},
                                      { 'name': 'class',
                                        'operand': 'includes',
                                        'values': 'b'}]},
                    { 'operand': 'AND',
                      'parameters': [ { 'name': 'class',
                                        'operand': 'includes',
                                        'values': 'c'}]},
                    { 'operand': 'AND',
                      'parameters': [ { 'name': 'href',
                                        'operand': 'startswith',
                                        'values': 'https'}]},
                    { 'operand': 'AND',
                      'parameters': [ { 'name': 'src',
                                        'operand': 'endswith',
                                        'values': '.jpg'}]}]}
```

To an index like this ...

```
  'id' : [
      {
        'operand' : 'is',
        'values' : 'a',
        'AND' : {
          'class' : [
              {
                'operand' : 'includes',
                'values' : 'b',
                'RESULT' : 'R1'
              }
            ]
        }
      },
      {
        'operand' : 'contains',
        'values' : 'box',
        'RESULT' : 'R2'
      }
   ]
  'class' : [
    {
      'operand' : 'includes',
      'values' : 'c',
      'RESULT' : 'R3'
    }
  ],
```
