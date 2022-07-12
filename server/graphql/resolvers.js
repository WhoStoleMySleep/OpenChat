const Message = require('../models/Message');
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

module.exports = {
  Mutation: {
    async createMessage(_, { text, author }) {
      const newMessage = new Message({
        text: text,
        author: author,
      });

      const res = await newMessage.save();

      pubsub.publish('MESSAGE_CREATED', {
        messageCreated: {
          text: text,
          author: author,
        },
      });

      return {
        id: res.id,
        ...res._doc,
      };
    },
  },
  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator('MESSAGE_CREATED'),
    },
  },
  Query: {
    messages: async () => {
      return Message.find({});
    },
  },
};
