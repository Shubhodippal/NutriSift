package com.shubhodip.nutrisift.recipe;

public class MealPlanRequest {
    private String uid;
    private String mail;
    
    public String getUid(){ 
        return uid;
    }
    public void setUid(String uid){
        this.uid = uid; 
    }
    public String getMail(){
        return mail; 
    }
    public void setMail(String mail){
        this.mail = mail; 
    }
}
