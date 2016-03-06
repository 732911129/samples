import json
import index

from klein import Klein

class Guesser(object):
  app = Klein()

  @app.route('/guess', methods=['POST'])
  def guess(self, request):
    request.setHeader('Content-Type', 'application/json')
    body = json.loads(request.content.read())
    data = index.guess( body[ "word" ], body[ "tried" ] )
    return json.dumps( data )

if __name__ == '__main__':
  store = Guesser()
  store.app.run('localhost', 8888)
