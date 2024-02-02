// for testing
export default function handler(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    const sendEvent = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        res.flush();
    };

    // 示例：每秒发送一个事件
    const interval = setInterval(() => {
        console.log('Sending event...');
        sendEvent({ time: new Date().toISOString() });
    }, 1000);

    req.on('close', () => {
        clearInterval(interval);
        res.end();
    });
}