require 'sinatra'
require 'octokit'
require 'slim'


team_id = ENV["GITHUB_TEAM_ID"]

client = Octokit::Client.new(access_token: ENV["GITHUB_TOKEN"])

get "/" do
  slim :index
end

post "/add" do
  client.add_team_membership(team_id, params["github"])
  "OK, Check your EMAIL"
end