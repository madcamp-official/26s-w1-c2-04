import sqlite3

conn=sqlite3.connect('wordnote.db')
print("완료")
conn.close()