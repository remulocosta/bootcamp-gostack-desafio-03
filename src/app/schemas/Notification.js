import mongoose from 'mongoose';

const Notificationschema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    helporder: {
      type: Number,
      required: true,
    },
    student: {
      type: Number,
      required: true,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Notification', Notificationschema);
