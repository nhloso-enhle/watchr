import mongoose from 'mongoose';

const watchlistItemSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titleId:       { type: String, required: true },
  primaryTitle:  { type: String, required: true },
  originalTitle: String,
  type:          String,
  startYear:     Number,
  primaryImage:  { url: String, width: Number, height: Number },
  rating:        { aggregateRating: Number, voteCount: Number },
  genres:        [String],
  plot:          String,        // short blurb from search result
  description:   String,        // full plot from title detail API (patched in background)
  status: {
    type: String,
    enum: ['want_to_watch', 'watching', 'completed'],
    default: 'want_to_watch',
  },
  isFavourite: { type: Boolean, default: false },
  wasUpcoming: { type: Boolean, default: false },
  releasedAt:  Date,
}, { timestamps: true });

watchlistItemSchema.index({ userId: 1, titleId: 1 }, { unique: true });

export default mongoose.model('WatchlistItem', watchlistItemSchema);
