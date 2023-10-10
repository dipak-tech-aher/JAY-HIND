
import React, { useCallback, useEffect, useState, useContext, useRef } from "react";
const RecentChats = () => {
    return (
        <div className="mb-2">
            <div className="cmmn-skeleton">
                <span className="skel-header-title">Recent Chats</span>
                <div className="skel-recent-chat">
                    <div className="skel-rec-chat-hist">
                        <span className="skel-letter-cirlce circle-l-pink">
                            J
                        </span>
                        <div className="skel-chat">
                            <span className="skel-chat-name">Johnson</span>
                            <p className="skel-chat-source"><span>WhatsApp</span><span>13m 15sec</span></p>
                        </div>
                        <i className="material-icons">arrow_forward_ios</i>
                    </div>
                    <div className="skel-rec-chat-hist">
                        <span className="skel-letter-cirlce circle-l-blue">
                            S
                        </span>
                        <div className="skel-chat">
                            <span className="skel-chat-name">Srinivasan</span>
                            <p className="skel-chat-source"><span>WhatsApp</span><span>13m 15sec</span></p>
                        </div>
                        <i className="material-icons">arrow_forward_ios</i>
                    </div>
                    <div className="skel-rec-chat-hist">
                        <span className="skel-letter-cirlce circle-l-purple">
                            O
                        </span>
                        <div className="skel-chat">
                            <span className="skel-chat-name">Omprakash</span>
                            <p className="skel-chat-source"><span>WhatsApp</span><span>13m 15sec</span></p>
                        </div>
                        <i className="material-icons">arrow_forward_ios</i>
                    </div>
                    <div className="skel-rec-chat-hist">
                        <span className="skel-letter-cirlce circle-l-yellow">
                            S
                        </span>
                        <div className="skel-chat">
                            <span className="skel-chat-name">Srinivasan</span>
                            <p className="skel-chat-source"><span>WhatsApp</span><span>13m 15sec</span></p>
                        </div>
                        <i className="material-icons">arrow_forward_ios</i>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RecentChats;