const words = require('./words');
const { setSession, decreaseAttempts, getAttempts, deleteSession } = require('./db');
const { ATTEMPTS_COUNT, API_VERSION } = require('./constants');
const { startWords, correctAnswer, wrongAnswer } = require('./phrases');
const { random } = require('lodash');

const WORDS_COUNT = words.length - 1;

const getWord = () => words[random(WORDS_COUNT)];

// eslint-disable-next-line camelcase
const sendJson = (res, session, { text, tts, end_session = false }) => {
  res.json({
    version: API_VERSION,
    session,
    response: {
      text,
      tts,
      end_session,
    },
  });
};

exports.onStart = (res, session) => {
  const firstWord = startWords[random(startWords.length - 1)];
  const word = getWord();

  setSession(session.session_id, {
    attempts: ATTEMPTS_COUNT,
    word,
  });

  sendJson(res, session, {
    text: `${firstWord} Вам нужно сказать сколько букв в моем слове. Если ошибетесь 3 раза – вы проиграли! Чтобы закончить игру, скажите «хватит». \nСлушайте моё первое слово: 👂 ${word}`,
    tts: `${firstWord} - - - Вам нужно сказать, сколько букв в моем слове. - Если ошибетесь 3 раза - — - вы проиграли! - - Чтобы закончить игру, скажите «хватит». - - - Слушайте мое первое слово: - - - ${word}`,
  });
};

exports.onDone = (res, session) => {
  sendJson(res, session, {
    text: 'Если захотите еще поиграть, скажите «Давай сыграем в длину слов»',
    tts: 'Если захотите еще поиграть, скажите «Давай сыграем в длину слов»',
    end_session: true,
  });
};

exports.onUnknown = (res, session) => {
  sendJson(res, session, {
    text: 'Не поняла вас, пожалуйста повторите.',
    tts: 'Не поняла вас, пож+алуста повторите.',
  });
};

exports.onCorrect = (res, session) => {
  const firstPhrase = correctAnswer.firstPhrases[random(correctAnswer.firstPhrases - 1)];
  const secondPhrase = correctAnswer.secondPhrases[random(correctAnswer.secondPhrases - 1)];
  const thirdPhrase = correctAnswer.thirdPhrases[random(correctAnswer.thirdPhrases - 1)];
  const word = getWord();

  setSession(session.session_id, {
    attempts: ATTEMPTS_COUNT,
    word,
  });

  sendJson(res, session, {
    text: `${firstPhrase} ${secondPhrase} ${thirdPhrase}: 👂`,
    tts: `${firstPhrase} - - - ${secondPhrase} - - ${thirdPhrase}: - - - ${word}`,
  });
};

exports.onWrong = (res, session) => {
  const sessionId = session.session_id;
  decreaseAttempts(sessionId);

  const attempts = getAttempts(sessionId);

  if (attempts > 0) {
    const firstPhrase = wrongAnswer.firstPhrases[random(wrongAnswer.firstPhrases - 1)];

    sendJson(res, session, {
      text: `${firstPhrase}, попробуйте еще раз, у вас ${wrongAnswer.attemptsPhrases[attempts]}`,
      tts: `${firstPhrase}, - - - попробуйте еще раз, - - у вас ${wrongAnswer.attemptsPhrases[attempts]}`,
    });
  } else {
    deleteSession(sessionId);

    sendJson(res, session, {
      text: 'Вы проиграли!',
      tts: 'Вы проиграли',
      end_session: true,
    });
  }
};
