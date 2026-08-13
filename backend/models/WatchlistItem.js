import mongoose from 'mongoose';

const watchlistItemSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titleId:       { type: String, required: true }, // e.g. "movie-550" or "tv-1399"
  tmdbId:        Number,
  mediaType:     { type: String, enum: ['movie', 'tv'] },
  primaryTitle:  { type: String, required: true },
  originalTitle: String,
  type:          String,   // 'movie' | 'tvSeries'
  startYear:     Number,
  primaryImage:  { url: String },
  backdrop:      { url: String },
  rating:        { aggregateRating: Number, voteCount: Number },
  genres:        [String],
  plot:          String,
  description:   String,
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
