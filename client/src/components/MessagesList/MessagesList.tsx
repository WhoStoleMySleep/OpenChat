import { gql, useQuery, useSubscription } from '@apollo/react-hoc';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSound from 'use-sound';
import notificationSfx from '../../assets/sounds/notification.mp3';
import useRetainUpdatedValue from '../../hooks/useRetainUpdatedValue/useRetainUpdatedValue';
import { setMessages } from '../../redux/componentReducers/messages';
import { setUnreadMessages } from '../../redux/componentReducers/unreadMessages';
import './MessagesList.scss';

const MESSAGES_SUBSCRIPTION = gql`
  subscription MessageCreated {
    messageCreated {
      text
      author
    }
  }
`;

const MESSAGES_UPDATED = gql`
  subscription MessageUpdated {
    messageUpdated {
      id
      text
    }
  }
`;

const MESSAGES_QUERY = gql`
  query Messages {
    messages {
      id
      text
      author
    }
  }
`;

function MessagesList() {
  const messages = useSelector((state: { messages: any }) => state.messages);
  const { loading: loadingQuery, data: dataQuery } = useQuery(MESSAGES_QUERY);
  const [play] = useSound(notificationSfx);
  const { onBlur } = useRetainUpdatedValue('onBlur');
  const dispatch = useDispatch();

  const { unreadMessages } = useSelector(
    (state: { unreadMessages: { unreadMessages: string[] } }) =>
      state.unreadMessages
  );
  const { author } = useSelector(
    (state: { author: { author: string } }) => state.author
  );

  useEffect(() => {
    if (!loadingQuery) dispatch(setMessages(dataQuery.messages.slice(-39)));
  }, [!loadingQuery]);

  useEffect(() => {
    const messagesList = document.querySelector('.messages-list');

    if (messagesList) {
      messagesList.scrollTop = messagesList.scrollHeight;
    }
  });

  useSubscription(MESSAGES_SUBSCRIPTION, {
    onSubscriptionData: (data) => {
      const message = data.subscriptionData.data.messageCreated;
      const idGen = Math.floor(Math.random() * (999999999 + 1));

      dispatch(
        setMessages([
          ...messages.messages.slice(-38),
          { id: idGen, ...message },
        ])
      );

      if (message.author !== author) {
        if (document.hidden && message.text.split(' ')[0] === `@${author}`) {
          play();
          dispatch(
            setUnreadMessages([
              ...unreadMessages.slice(-3),
              {
                text: `${
                  message.text.slice().length <= 53
                    ? message.text.split(`@${author}`).join('')
                    : `${message.text.split(`@${author}`).join('').slice(0, 52)
                    }...`
                }`,
                id: idGen,
              },
            ])
          );
        }
      }
    },
  });

  useSubscription(MESSAGES_UPDATED, {
    onSubscriptionData: (data) => {
      const message = data.subscriptionData.data.messageUpdated;

      const array = messages.messages.slice(-38);
      const { id, text } = message;
      const result = [];

      for (let index = 0; index < array.length; index += 1) {
        result.push(array[index].id === id ? { ...array[index], text } : array[index]);
      }

      dispatch(
        setMessages([
          ...result
        ])
      );
    }
  });

  function autoSize(event: { target: HTMLElement; }) {
    const element = event.target;

    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight - 4}px`;
  }

  for (let index = 0; index < messages.messages.length; index += 1) {
    const textContainer = document.querySelectorAll('.messages-list__text')[index];

    if (textContainer && textContainer.tagName === 'TEXTAREA' && textContainer.scrollTop <= 27) {
      (textContainer as HTMLTextAreaElement).style.height = `${textContainer.scrollHeight - 4}px`;
    }
  }

  return (
    <ul className="messages-list">
      {messages.messages.map(
        (res: { text: string; id: number; author: string }) => (
          <li
            key={res.id}
            className={`messages-list__message ${
              author === res.author ? 'me-author' : ''
            }`}
          >
            <p className="messages-list__author">{res.author}</p>
            {author !== res.author
              ? <p className="messages-list__text">{res.text}</p>
              : (
                <textarea
                  defaultValue={res.text}
                  className="messages-list__text"
                  rows={1}
                  onChange={autoSize}
                  onBlur={(event) => onBlur(event, res.id)}
                />
              )}
          </li>
        )
      )}
    </ul>
  );
}

export default MessagesList;
