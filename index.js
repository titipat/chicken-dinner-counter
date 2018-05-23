let moment = require('moment')
let assert = require('assert')
let Request = require('request-promise-native')
require('dotenv').config()

if (!process.env.API_KEY) {
    console.log(process.env)
    throw ('The API KEY is required to operate.')
}

let request = Request.defaults({
        headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            Accept: 'application/vnd.api+json'
        },
        json: true
    })


let requestMatch = async (matchId) => {
    let uri = `https://api.playbattlegrounds.com/shards/pc-sea/matches/${matchId}`
    // console.log(uri)
    return request.get(uri)
}

let filterTargetPlayer = (targetPlayerId, players) => {
    return players.filter(element => {
        // console.log(element)
        return element.type === 'participant' 
            && element.attributes.stats.playerId === targetPlayerId
    }).pop() || undefined
}

let filterRange = (match => {
    // console.log(match)
    let thisMatch = new moment(match.data.attributes.createdAt)
    let now = moment()

    return now - thisMatch < moment.duration(1, 'days');
})


let getWinCount = async (playerId) => {
    console.log(new Date)
    // let response = await executeTheRequest()
    // let match = JSON.parse(response)
    // let players = match.included
    // // console.log(match)
    // // console.log(Object.keys())
    // let player = filterTargetPlayer(TARGET_PLAYER_ID, players)
    // if (!player) {
    //     console.error('Player not found')
    //     return 
    // }
    // console.log(player.attributes.stats)

    let player = await request.get(`https://api.playbattlegrounds.com/shards/pc-sea/players/${playerId}`)
    // console.log(Object.keys(player.data.relationships.matches.data))
    let histories = player.data.relationships.matches.data
    histories = histories.splice(0, 5)
    // console.log(histories)
    // return
    matches = await Promise.all(histories.map(async history => {
        return requestMatch(history.id)
    }))

    matches = matches.filter(filterRange)
    // console.log(matches)
    // return
    matches = matches.map(match => {
        return filterTargetPlayer(playerId, match.included)
    })


    // console.log(matches)
    matches.forEach(element => {
        // console.log(element.attributes.stats)
    });

    winCount = matches.reduce((prev, current) => {
        return current.attributes.stats.winPlace === 1
            ? ++prev
            : prev
    }, 0)

    // console.log(winCount)

    return winCount

}

let main = async () => {
    let playerId = 'account.73e32dd282064bd091aa7d4f95730c1e'
    let winCount = await getWinCount(playerId)

    console.log('winCount', winCount)

    assert.equal(Number.isFinite(winCount), true, 'Expect winCount to be a finite number.')
}

main()