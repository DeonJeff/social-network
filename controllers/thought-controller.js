const { User, Thought} = require('../models');

const thoughtController = {
  getAllThought(req, res) {
    Thought.find()
      .populate({
           path: 'reactions', 
           select: '-__v' 
        })
      .select('-__v')
      .sort({_id: -1})
      .then(dbThoughtData => res.json(dbThoughtData))
      .catch(err =>  {
          console.log(err);
          res.sendStatus(400);
      });
  },

  getThoughtById({ params }, res) {
    Thought.findOne({ _id: params.id })
      .populate({ 
          path: 'reactions', 
          select: '-__v' 
        })
      .select('-__v')
      .sort({_id: -1})
      .then(dbThoughtData => res.json(dbThoughtData))
      .catch(err => {
          console.log(err),
          res.sendStatus(400);
      });
  },

  createThought({ body }, res) {
    Thought.create(body)
        .then(({ _id }) => {
            return User.findOneAndUpdate(
                { _id: body.userId },
                { $push: { thoughts: _id } },
                { new: true }
            );
        })
        .then(dbThoughtData=> { res.json(dbThoughtData); })
        .catch(err => res.json(err));
},

  // update Thought by id
  updateThought({ params, body }, res) {
    Thought.findOneAndUpdate({ _id: params.id }, body, { new: true, runValidators: true })
      .then(dbThoughtData=> {
        if (!dbThoughtData) {
            res.status(404).json({ message: 'No thoughts found!' });
            return;
          }
          res.json(dbThoughtData);
        })
        .catch(err => res.json(err));
    },
  

  // delete thought by ID
  deleteThought({ params }, res) {
    Thought.findOneAndDelete({ _id: params.id })
      .then(dbThoughtData => res.json(dbThoughtData))
      .catch(err => res.json(err));
  },

  createReaction({params, body}, res) {
    Thought.findOneAndUpdate(
      {_id: params.thoughtId}, 
      {$push: {reactions: body}}, 
      {new: true, runValidators: true})
    .populate({path: 'reactions', select: '-__v'})
    .select('-__v')
    .then(dbThoughtData => {
    if (!dbThoughtData) {
        res.status(404).json({message: 'No thought with this particular ID!'});
        return;
    }
    res.json(dbThoughtData);
    })
    .catch(err => res.status(400).json(err))

},

  deleteReaction({ params }, res) {
    Thought.findOneAndUpdate(
      { _id: params.thoughtId },
      { $pull: { reactions: { reactionId: params.reactionId } } },
      { new: true }
    )
      .then(dbThoughtData => { res.json(dbThoughtData); })
      .catch(err => res.json(err));
  }
};

module.exports = thoughtController;