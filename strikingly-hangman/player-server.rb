require 'webrick'

class Player < WEBrick::HTTPServlet::AbstractServlet
  def do_GET request, response
    response.status = 200
    response[ 'Content-Type' ] = 'text/plain'
    response.body = 'Hello, Awesome!'
  end
end

server = WEBrick::HTTPServer.new :Port => 8080

trap 'INT' do server.shutdown end

server.mount '/play', Player

server.start


