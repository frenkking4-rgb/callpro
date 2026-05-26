import os
import re

ROOT = os.path.abspath(os.path.dirname(__file__))

HTML_COMMENT = re.compile(r'<!--(.*?)-->', re.DOTALL)
CSS_COMMENT = re.compile(r'/\*(.*?)\*/', re.DOTALL)

JS_SINGLE_COMMENT = re.compile(r'//.*?$|/\*.*?\*/', re.DOTALL | re.MULTILINE)


def remove_html_comments(text):
    return HTML_COMMENT.sub('', text)


def remove_css_comments(text):
    return CSS_COMMENT.sub('', text)


def remove_js_comments(text):
    result = []
    i = 0
    length = len(text)
    in_string = None
    escape = False
    while i < length:
        ch = text[i]
        if in_string:
            result.append(ch)
            if escape:
                escape = False
            elif ch == '\\':
                escape = True
            elif ch == in_string:
                in_string = None
            i += 1
            continue
        if ch in ('"', "'", '`'):
            in_string = ch
            result.append(ch)
            i += 1
            continue
        if text.startswith('//', i):
            j = text.find('\n', i)
            if j == -1:
                break
            i = j
            continue
        if text.startswith('/*', i):
            j = text.find('*/', i + 2)
            if j == -1:
                break
            i = j + 2
            continue
        result.append(ch)
        i += 1
    return ''.join(result)


def process_html_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        data = f.read()
    data = remove_html_comments(data)
    def repl(match):
        tag = match.group(1).lower()
        content = match.group(2)
        if tag == 'script':
            return f'<script{match.group(3)}>{remove_js_comments(content)}</script>'
        if tag == 'style':
            return f'<style{match.group(3)}>{remove_css_comments(content)}</style>'
        return match.group(0)
    pattern = re.compile(r'<(script|style)([^>]*)>(.*?)</\1>', re.DOTALL | re.IGNORECASE)
    data = pattern.sub(repl, data)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(data)


def process_file(path):
    _, ext = os.path.splitext(path)
    if ext == '.html':
        process_html_file(path)
    elif ext == '.css':
        with open(path, 'r', encoding='utf-8') as f:
            data = f.read()
        data = remove_css_comments(data)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(data)
    elif ext == '.js':
        with open(path, 'r', encoding='utf-8') as f:
            data = f.read()
        data = remove_js_comments(data)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(data)


if __name__ == '__main__':
    for root, dirs, files in os.walk(ROOT):
        for name in files:
            if name.endswith(('.html', '.css', '.js')) and name != os.path.basename(__file__):
                path = os.path.join(root, name)
                process_file(path)
    print('Removed comments from HTML/CSS/JS files.')
