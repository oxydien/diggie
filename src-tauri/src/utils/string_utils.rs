pub trait LocalToString {
    fn local_to_string(&self) -> String;
}

impl LocalToString for String {
    fn local_to_string(&self) -> String {
        self.clone()
    }
}

impl LocalToString for &str {
    fn local_to_string(&self) -> String {
        self.to_string()
    }
}

impl LocalToString for &String {
    fn local_to_string(&self) -> String {
        self.to_string()
    }
}

impl LocalToString for &&str {
    fn local_to_string(&self) -> String {
        self.to_string()
    }
}

impl LocalToString for &&String {
    fn local_to_string(&self) -> String {
        self.to_string()
    }
}

impl LocalToString for serenity::Error {
    fn local_to_string(&self) -> String {
        self.to_string()
    }
}
