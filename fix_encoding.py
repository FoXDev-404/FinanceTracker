import codecs

with open('api/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace smart quotes and other problematic chars
content = content.replace('\u201c', '"').replace('\u201d', '"').replace('\u2018', "'").replace('\u2019', "'")

with open('api/views.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed encoding')
