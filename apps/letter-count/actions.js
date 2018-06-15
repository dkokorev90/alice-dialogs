const words = require('./words');
const { setSession, decreaseAttempts, getSession, deleteSession, setLoss } = require('./db');
const { ATTEMPTS_COUNT, API_VERSION } = require('./constants');
const { startWords, correctAnswer, wrongAnswer } = require('./phrases');
const { random } = require('lodash');

const WORDS_COUNT = words.length - 1;

const getWord = () => words[random(WORDS_COUNT)];
const getRandomPhrase = arr => arr[random(arr.length - 1)];

const getNoun = (number, one, two, five) => {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) {
    return five;
  }
  n %= 10;
  if (n === 1) {
    return one;
  }
  if (n >= 2 && n <= 4) {
    return two;
  }
  return five;
};

// eslint-disable-next-line camelcase
const sendJson = (res, session, { text, tts, buttons, end_session = false }) => {
  res.json({
    version: API_VERSION,
    session,
    response: {
      text,
      tts,
      end_session,
      buttons,
    },
  });
};

exports.onStart = (res, session) => {
  const firstWord = getRandomPhrase(startWords);
  const word = getWord();

  setSession(session.session_id, {
    attempts: ATTEMPTS_COUNT,
    word,
  });

  sendJson(res, session, {
    text: `${firstWord} Вам нужно сказать сколько букв в моем слове. Если ошибетесь 3 раза – вы проиграли! Чтобы закончить игру, скажите «хватит». \nСлушайте моё первое слово: 👂`,
    tts: `${firstWord} - - - Вам нужно сказать, сколько букв в моем слове. - Если ошибетесь 3 раза - — - вы проиграли! - - Чтобы закончить игру, скажите «хватит». - - - Слушайте мое первое слово: - - - ${word}`,
  });
};

exports.onDone = (res, session) => {
  deleteSession(session.session_id);

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
  const firstPhrase = getRandomPhrase(correctAnswer.firstPhrases);
  const secondPhrase = getRandomPhrase(correctAnswer.secondPhrases);
  const thirdPhrase = getRandomPhrase(correctAnswer.thirdPhrases);
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

  const { attempts, word } = getSession(sessionId);

  if (attempts > 0) {
    const firstPhrase = getRandomPhrase(wrongAnswer.firstPhrases);

    sendJson(res, session, {
      text: `${firstPhrase}, попробуйте еще раз, у вас ${wrongAnswer.attemptsPhrases[attempts]}`,
      tts: `${firstPhrase}, - - - попробуйте еще раз, - - у вас ${wrongAnswer.attemptsPhrases[attempts]}`,
    });
  } else {
    setLoss(sessionId);

    sendJson(res, session, {
      text: `Вы проиграли! В слове «${word}» - ${word.length} ${getNoun(word.length, 'буква', 'буквы', 'букв')}. Сыграем еще раз?`,
      tts: `Вы проиграли! - В слове «${word}» - - ${word.length} ${getNoun(word.length, 'буква', 'буквы', 'букв')}. - - Сыграем еще раз?`,
      buttons: [
        {
          title: 'Да',
          hide: true,
        },
        {
          title: 'Нет',
          hide: true,
        },
      ],
    });
  }
};
