import { PairGameQueryRepo } from './../quiz.pair/dv-psql/pair.game.query.repo';
import { PairGameRepo } from './../quiz.pair/dv-psql/pair.game.repo';

export const chekAnswer = async (pairId: string, playerId: string, 
    pairGameRepo: PairGameRepo, pairGameQueryRepo: PairGameQueryRepo) => {
    const pair = await pairGameQueryRepo.getPairById(pairId)
    const resultFirstPlayer = await pairGameQueryRepo.getResultPairsByPlayerId(pairId, pair!.firstPlayerId)
    const resultSecondPlayer = await pairGameQueryRepo.getResultPairsByPlayerId(pairId, pair!.secondPlayerId)
    if (resultFirstPlayer!.answersStatus.length !== 5) {
        while (resultFirstPlayer!.answersStatus.length < 5) {
            resultFirstPlayer!.answersStatus.push('Incorrect')
            resultFirstPlayer!.answersAddedAt.push(`${(new Date()).toISOString()}`)
        }

    }
    if (resultSecondPlayer!.answersStatus.length !== 5) {
        while (resultSecondPlayer!.answersStatus.length < 5) {
            resultSecondPlayer!.answersStatus.push('Incorrect')
            resultSecondPlayer!.answersAddedAt.push(`${(new Date()).toISOString()}`)
        }
    }
    const updateResultFirstPlayer = await pairGameRepo.
        updateResultFinish(pairId, pair!.firstPlayerId, resultFirstPlayer!.answersStatus, resultFirstPlayer!.answersAddedAt)
    const updateResultSecondPlayer = await pairGameRepo.
        updateResultFinish(pairId, pair!.secondPlayerId, resultSecondPlayer!.answersStatus, resultSecondPlayer!.answersAddedAt)
    const updateStatusByPair = await pairGameRepo.updateStatusByPair(pairId)
    
    const resultFinishFirstPlayer = await pairGameQueryRepo.getResultPairsByPlayerId(pairId, pair!.firstPlayerId)
    const resultFinishSecondPlayer = await pairGameQueryRepo.getResultPairsByPlayerId(pairId, pair!.secondPlayerId)


    let scoreOne = 0
    let scoreTwo = 0

    const answersAddedAtOne = resultFinishFirstPlayer!.answersAddedAt[4] //время последнего ответа пользователя 1
    const answersAddedAtTwo = resultFinishSecondPlayer!.answersAddedAt[4] //время последнего ответа пользователя 2

    if (resultFinishFirstPlayer!.answersStatus.includes('Correct')) {
        scoreOne++
        if (new Date(answersAddedAtOne) < new Date(answersAddedAtTwo)) {
            scoreOne++
        }
    } //бонусный бал

    if (resultFinishSecondPlayer!.answersStatus.includes('Correct')) {
        scoreTwo++
        if (new Date(answersAddedAtOne) > new Date(answersAddedAtTwo)) {
            scoreTwo++
        }
    }//бонусный бал

    let winnerPlayer = {
        id: pair!.firstPlayerId,
        score: scoreOne
    }

    let loserPlayer = {
        id: pair!.secondPlayerId,
        score: scoreTwo
    }

    if (scoreTwo > scoreOne) {
        winnerPlayer = {
            id: pair!.secondPlayerId,
            score: scoreTwo
        }
        loserPlayer = {
            id: pair!.firstPlayerId,
            score: scoreOne
        }
    }

    if (scoreTwo !== scoreOne) {
        const updateDateFinish = await pairGameRepo.updateStatusGame(pair!.id, winnerPlayer, loserPlayer)
    }
    if (scoreTwo === scoreOne) {
        const updateDateFinish = await pairGameRepo.resultUpdateIsAdraw(pair!.id, winnerPlayer, loserPlayer)
    }
    return true
}