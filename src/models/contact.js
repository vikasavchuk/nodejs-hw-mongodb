import { model, Schema } from 'mongoose';

const contactsSchema = new Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String },
  isFavourite: { type: Boolean, default: false },
  contactType: { type: String, required: true, enum: ['work', 'home', 'personal'], default: 'personal' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true,
  versionKey: false,
});

const ContactsCollection = model('Contact', contactsSchema);

export { ContactsCollection };

