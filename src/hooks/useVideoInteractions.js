import { useState, useEffect } from "react";

export function useVideoInteractions(videoId) {
  const [interactions, setInteractions] = useState({
    likes: 0,
    liked: false,
    views: 0,
    comments: [],
  });

  // Load interactions from localStorage
  useEffect(() => {
    const allInteractions = JSON.parse(
      localStorage.getItem("letstreamInteractions") || "{}"
    );

    const videoData = allInteractions[videoId] || {
      likes: Math.floor(Math.random() * 1000) + 50,
      liked: false,
      views: Math.floor(Math.random() * 50000) + 1000,
      comments: [
        {
          id: "1",
          author: "Alex Gamer",
          avatar:
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
          text: "This is actually insane! 🔥",
          time: "2 hours ago",
          likes: 12,
        },
        {
          id: "2",
          author: "Sarah Vlogs",
          avatar:
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
          text: "Love the editing on this one.",
          time: "5 hours ago",
          likes: 8,
        },
      ],
    };

    setInteractions(videoData);
  }, [videoId]);

  const saveInteractions = (newData) => {
    const allInteractions = JSON.parse(
      localStorage.getItem("letstreamInteractions") || "{}"
    );
    allInteractions[videoId] = newData;
    localStorage.setItem(
      "letstreamInteractions",
      JSON.stringify(allInteractions)
    );
    setInteractions(newData);
  };

  const toggleLike = () => {
    const newLiked = !interactions.liked;
    saveInteractions({
      ...interactions,
      liked: newLiked,
      likes: interactions.likes + (newLiked ? 1 : -1),
    });
  };

  const addComment = (text, author, avatar) => {
    const newComment = {
      id: Date.now().toString(),
      author,
      avatar,
      text,
      time: "Just now",
      likes: 0,
    };
    saveInteractions({
      ...interactions,
      comments: [newComment, ...interactions.comments],
    });
  };

  const incrementViews = () => {
    saveInteractions({
      ...interactions,
      views: interactions.views + 1,
    });
  };

  return {
    ...interactions,
    toggleLike,
    addComment,
    incrementViews,
  };
}
