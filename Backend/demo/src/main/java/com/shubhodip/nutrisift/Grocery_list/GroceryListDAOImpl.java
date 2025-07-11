package com.shubhodip.nutrisift.Grocery_list;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class GroceryListDAOImpl implements GroceryListDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public List<GroceryItem> getGroceryList(String userId) {
        try {
            String sql = "SELECT * FROM grocery_list WHERE uid = ? ORDER BY category, item_name";
            return jdbcTemplate.query(sql, new GroceryItemRowMapper(), userId);
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public boolean saveGroceryList(String userId, String email, List<GroceryItem> items) {
        try {
            String verifyEmailSql = "SELECT email FROM users WHERE userid = ?";
            String verifiedEmail = jdbcTemplate.queryForObject(verifyEmailSql, String.class, userId);
            
            if (!email.equals(verifiedEmail)) {
                email = verifiedEmail;
            }
            
            deleteGroceryList(userId);
            
            for (GroceryItem item : items) {
                String sql = "INSERT INTO grocery_list (uid, mail, state, item_name, quantity, category) " +
                            "VALUES (?, ?, ?, ?, ?, ?)";
                
                jdbcTemplate.update(
                    sql, 
                    userId,
                    email, 
                    item.isChecked() ? "checked" : "active",
                    item.getItemName(),
                    item.getQuantity(),
                    item.getCategory()
                );
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean deleteGroceryList(String userId) {
        try {
            String sql = "DELETE FROM grocery_list WHERE uid = ?";
            int rowsAffected = jdbcTemplate.update(sql, userId);
            return rowsAffected >= 0; 
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean updateGroceryItem(long itemId, GroceryItem item) {
        try {
            String sql = "UPDATE grocery_list SET item_name = ?, quantity = ?, category = ?, state = ? " +
                         "WHERE id = ?";
            
            int rowsAffected = jdbcTemplate.update(
                sql, 
                item.getItemName(),
                item.getQuantity(),
                item.getCategory(),
                item.isChecked() ? "checked" : "active",
                itemId
            );
            
            return rowsAffected > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean deleteGroceryItem(long itemId) {
        try {
            String sql = "DELETE FROM grocery_list WHERE id = ?";
            int rowsAffected = jdbcTemplate.update(sql, itemId);
            return rowsAffected > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean toggleItemCheck(long itemId) {
        try {
            String getStateSql = "SELECT state FROM grocery_list WHERE id = ?";
            String currentState = jdbcTemplate.queryForObject(getStateSql, String.class, itemId);
            
            String newState = "checked".equals(currentState) ? "active" : "checked";
            
            String updateSql = "UPDATE grocery_list SET state = ? WHERE id = ?";
            int rowsAffected = jdbcTemplate.update(updateSql, newState, itemId);
            
            return rowsAffected > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private static class GroceryItemRowMapper implements RowMapper<GroceryItem> {
        @Override
        public GroceryItem mapRow(ResultSet rs, int rowNum) throws SQLException {
            GroceryItem item = new GroceryItem();
            item.setId(rs.getLong("id"));
            item.setUid(rs.getString("uid"));
            item.setMail(rs.getString("mail"));
            item.setState(rs.getString("state"));
            item.setItemName(rs.getString("item_name"));
            item.setQuantity(rs.getString("quantity"));
            item.setCategory(rs.getString("category"));
            item.setCreationTime(rs.getTimestamp("creation_time"));
            item.setChecked("checked".equals(rs.getString("state")));
            return item;
        }
    }
}
