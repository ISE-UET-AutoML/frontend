import { useState, useEffect, useRef } from 'react'
import { chat, clearHistory, getHistory } from 'src/api/chatbot'

export const useChatbot = () => {
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState([])
    const [showTitle, setShowTitle] = useState(true)
    const [chatbotDisplay, setChatbotDisplay] = useState(false)
    const [proceedState, setProceed] = useState(false)
    const [showChatbotButtons, setShowChatbotButtons] = useState(false)
    const textareaRef = useRef(null)
    const chatContainerRef = useRef(null)

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current?.resizableTextArea?.textArea

        if (!textarea) return

        textarea.style.height = 'auto'
        const newHeight = Math.max(textarea.scrollHeight, 40)

        textarea.style.height = `${newHeight}px`
    }, [input])

    // Chat scrolling logic
    function chatBotScroll(chatContainerRef, chatbotDisplay) {
        if (chatContainerRef.current) {
            const lastMessage =
                chatContainerRef.current.lastElementChild?.children[
                chatContainerRef.current.lastElementChild.children.length - 1
                ]
            const secondLastMessage =
                chatContainerRef.current.lastElementChild?.children[
                chatContainerRef.current.lastElementChild.children.length - 2
                ]
            let height = 0
            if (secondLastMessage) {
                height =
                    secondLastMessage.offsetHeight +
                    lastMessage.offsetHeight +
                    chatContainerRef.current.nextElementSibling.offsetHeight +
                    32
            }
            if (chatbotDisplay) {
                chatContainerRef.current.scrollTo({
                    top: chatContainerRef.current.scrollHeight - height,
                    behavior: 'smooth',
                })
            } else {
                chatContainerRef.current.scrollTo({
                    top: chatContainerRef.current.scrollHeight - height,
                })
            }
        }
    }

    // Auto-scroll when messages change
    useEffect(() => {
        if (chatContainerRef.current) {
            if (!chatbotDisplay) {
                setChatbotDisplay(true)
                chatBotScroll(chatContainerRef, chatbotDisplay)
            } else {
                setTimeout(() => {
                    chatBotScroll(chatContainerRef, chatbotDisplay)
                }, 500)
            }
        } else {
            setChatbotDisplay(false)
        }
    }, [messages, chatContainerRef])

    const getChatHistory = async () => {
        if (messages) {
            const response = await getHistory()
            console.log(response)
            const history = response.data.chatHistory
            if (messages.length === 0) {
                setMessages((previousMessages) => [
                    ...previousMessages,
                    {
                        role: 'assistant',
                        content: 'How can I help you create your project?',
                    },
                ])
            }
            setMessages((prevMessages) => {
                const newMessages = [...prevMessages, ...history]
                if (newMessages.length > 1) {
                    setShowTitle(false)
                    setShowChatbotButtons(true)
                }
                return newMessages
            })
        }
    }

    const userChat = async (input, confirmed = false, projectList = []) => {
        setShowTitle(false)
        setShowChatbotButtons(true)
        if (!confirmed) {
            setProceed((prev) => false)
        } else {
            setProceed((prev) => true)
        }
        setMessages((previousMessages) => [
            ...previousMessages,
            { role: 'user', content: input },
        ])
        setInput('')
        setMessages((previousMessages) => [
            ...previousMessages,
            { role: 'assistant', content: 'loading...' },
        ])
        try {
            const response = await chat(input, confirmed, projectList)
            setTimeout(() => {
                setMessages((previousMessages) => [
                    ...previousMessages.slice(0, -1),
                    { role: 'assistant', content: response.data.reply },
                ])
            }, 500)
            if (confirmed) return response.data.jsonSumm
            console.log(response)
        } catch (error) {
            console.error('Error receiving message:', error)
        }
    }

    const handleKeyPress = async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (input.trim()) {
                await userChat(input)
            }
        }
    }

    const newChat = async () => {
        setShowTitle(true)
        setShowChatbotButtons(false)
        const response = await clearHistory()
        setMessages([])
        setProceed((prev) => false)
    }

    const proceedFromChat = async (projectList = []) => {
        if (proceedState) {
            return null // Signal to close chatbot and open manual
        } else {
            setProceed((prev) => true)
            return await userChat('Create', true, projectList)
        }
    }

    return {
        // State
        input,
        setInput,
        messages,
        setMessages,
        showTitle,
        setShowTitle,
        chatbotDisplay,
        proceedState,
        showChatbotButtons,
        setShowChatbotButtons,
        textareaRef,
        chatContainerRef,

        // Actions
        getChatHistory,
        userChat,
        handleKeyPress,
        newChat,
        proceedFromChat,
    }
}
