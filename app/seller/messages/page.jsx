"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get("/api/contact");
      if (data.success) {
        setMessages(data.messages);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter((msg) => {
    const query = searchQuery.toLowerCase();
    return (
      msg.name.toLowerCase().includes(query) ||
      msg.email.toLowerCase().includes(query) ||
      (msg.subject && msg.subject.toLowerCase().includes(query)) ||
      msg.message.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen md:p-10 p-4 bg-gray-50/50 space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Customer Messages</h1>
          <p className="text-gray-500 text-sm mt-1">Read and reply to inquiries sent via the Contact Us form.</p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full outline-none border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:border-orange-500 bg-white"
          />
        </div>
      </div>

      {/* Messages Content */}
      {filteredMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 bg-white border border-gray-200 rounded-2xl p-8">
          <span className="text-4xl">✉️</span>
          <h3 className="text-lg font-semibold text-gray-850">No Messages Found</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            {searchQuery
              ? "No messages match your search criteria. Try using different keywords."
              : "When customers send you messages through the Contact Us form, they will appear here!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredMessages.map((msg) => (
            <div
              key={msg._id}
              className="bg-white border border-gray-200 hover:border-orange-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                
                {/* Message Header */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{msg.name}</h2>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{msg.email}</p>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(msg.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider block mb-1">
                    Subject: {msg.subject || "No Subject"}
                  </span>
                  <p className="text-gray-650 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {msg.message}
                  </p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <a
                  href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(
                    msg.subject || "NextCart Inquiry"
                  )}&body=Hello ${encodeURIComponent(msg.name)},\n\nThank you for reaching out to NextCart!\n\n`}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg text-sm transition shadow-sm"
                >
                  Reply via Email
                </a>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Messages;
