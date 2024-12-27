import os
import mysql.connector
from pathlib import Path

# 数据库配置
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'davidwang',
    'database': 'image_gallery'
}

# 连接数据库
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

# 图片目录的相对路径
image_dir = Path('public/image/ref-style')

try:
    # 遍历目录中的所有 jpg 文件
    for file_path in image_dir.glob('*.jpg'):
        # 提取文件名（不含扩展名）
        name = file_path.stem
        
        # 生成相对路径（使用正斜杠，因为这是 web 标准）
        relative_path = str(file_path).replace('\\', '/')
        
        # 准备 SQL 语句
        sql = """
        INSERT INTO Image (id, name, path, prompt, category, nsfw, createdAt, updatedAt)
        VALUES (UUID(), %s, %s, %s, %s, %s, NOW(), NOW())
        """
        
        # 设置默认值
        prompt = f"Reference image for {name} art style"
        category = "ref-style"
        nsfw = False
        
        # 执行插入
        cursor.execute(sql, (name, relative_path, prompt, category, nsfw))
        print(f"Imported: {name}")
    
    # 提交事务
    conn.commit()
    print("\nAll images have been imported successfully!")

except Exception as e:
    # 发生错误时回滚
    conn.rollback()
    print(f"An error occurred: {str(e)}")

finally:
    # 关闭数据库连接
    cursor.close()
    conn.close()