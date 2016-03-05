require 'webrick'
require 'net/http'
require 'uri'
require 'json'

begin 
  gem "unirest"
rescue LoadError
  system( "gem install unirest" )
  Gem.clear_paths
end

require 'unirest'

Unirest.timeout( 600 )

$current_session = ''
$already_tried = ''
$guess = ''

def init 
  command = {  
    'playerId'  => 'cris@dosaygo.com', 
    'action' => 'startGame'
  }
  return command
end

def nextWord session
  command = {
    'sessionId' => session,
    'action' => 'nextWord'
  }
  return command
end

def guessWord session, guess
  command = {
    'sessionId' => session,
    'action' => 'guessWord',
    'guess' => guess
  }
  return command
end

def getResult session 
  command = {
    'sessionId' => session,
    'action' => 'getResult'
  }
  return command
end

def handle response
  reply = response.body
  if reply[ "message" ] == "THE GAME IS ON"
    $current_session = reply[ "sessionId" ]
  end
  return reply.to_json
end

def nextTurn command
  return handle Unirest.post  'https://strikingly-hangman.herokuapp.com/game/on',
                headers: { 
                  'Accept' => 'application/json',
                  'Content-Type' => 'application/json'
                },
                parameters: command.to_json
end

def nextGuess word, tried
  return handleGuess Unirest.post  'http://localhost:8888/guess',
                headers: { 
                  'Accept' => 'application/json',
                  'Content-Type' => 'application/json'
                },
                parameters: { "word" => word, "tried" => tried }.to_json
end

def handleGuess response
  reply = response.body
  if reply[ "guesses" ].length == 0
    $guess = reply[ "fallback" ].pop()[0]
  else
    $guess = reply[ "guesses" ].pop()[0]
  end
  return reply.to_json
end

def handleInit response
  nextTurn init
  response.status = 200
  response['Access-Control-Allow-Origin'] = '*'
  response.body = '{"started":1}'
end

def handleNextWord response
  reply = JSON.parse nextTurn nextWord $current_session 
  $word = reply[ "data" ][ "word" ]
  $already_tried = ''
  response['Access-Control-Allow-Origin'] = '*'
  response.status = 200
  response.body = { "guess" => "None yet", "tried" => $already_tried, "word" => $word }.to_json
end

def handleGuessWord req, response
  if req.query.has_key?( "guess" )
    $guess = req.query[ "guess" ]
  else
    nextGuess $word, $already_tried
  end
  reply = JSON.parse nextTurn guessWord $current_session, $guess
  $already_tried += $guess
  $word = reply[ "data" ][ "word" ]
  response['Access-Control-Allow-Origin'] = '*'
  response.status = 200
  response.body = { "guess" => $guess, "tried" => $already_tried, "word" => $word }.to_json
end

def handleResult response
  reply = JSON.parse nextTurn getResult $current_session
  response['Access-Control-Allow-Origin'] = '*'
  response.status = 200
  response.body  = { "reply" => reply }.to_json
end

def handleError response
  response['Access-Control-Allow-Origin'] = '*'
  response.status = 400
  response.body = '{"error":1}'
end

class Player < WEBrick::HTTPServlet::AbstractServlet
  def do_GET req, response
    response[ 'Content-Type' ] = 'application/json'
    case req.query[ "command" ]
    when 'init'
      handleInit response
    when 'nextWord'
      handleNextWord response
    when 'guessWord'
      handleGuessWord req, response
    when 'getResult'
      handleResult response
    else
      handleError response
    end
  end
end

server = WEBrick::HTTPServer.new :Port => 8080

trap 'INT' do server.shutdown end

server.mount '/play', Player

server.start


